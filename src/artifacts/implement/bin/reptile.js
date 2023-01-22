import { stat, mkdir, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom";

const TARGET = resolve(dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "base10");

async function checkFolder(path) {
    try {
        await stat(path);
    } catch (err) {
        if (err.message.includes("no such file or directory")) {
            await mkdir(path);
        }
    }
}

function csvParser(document) {
    const csv = [];

    const rows = document.querySelectorAll("tr");

    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].querySelectorAll("td,th");
        const csvRow = [];
        for (let j = 0; j < cols.length; j++) {
            const data = cols[j].textContent;
            csvRow.push(isNaN(data) ? `"${data}"` : data);
        }
        csv.push(csvRow.join(","));
    }
    return csv.join("\n");
}

void async function() {
    const fullDoc = await fetch("https://www.southampton.ac.uk/~cpd/history.html", { method: "GET" });

    /* calculate and clean up unused */
    const { window: rawWindow } = new JSDOM(await fullDoc.text(), { runScripts: "dangerously" });

    rawWindow.document.querySelectorAll(".left-cell-BCE").forEach(element => element.remove());
    rawWindow.document.querySelectorAll(".left-cell-CE").forEach(element => element.remove());
    rawWindow.document.querySelectorAll(".section").forEach(element => element.remove());

    const rawFullDom = rawWindow.document.querySelector("body > table.content").innerHTML;
    const nonScript = rawFullDom.replaceAll(/<script[\d\D]*?>[\d\D]*?<\/script>/gm, '');

    /** table to csv */
    const { window } = new JSDOM(`<!DOCTYPE html><html lang="en"><body><table>${nonScript}</table></body></html>`);

    window.document.querySelectorAll(".left-cell, .left-cell-ya").forEach(element => {
        element.textContent = element.textContent.replaceAll(",", '')
    });

    const fulltext = csvParser(window.document); //window.document.querySelector("body > table").textContent;

    const nonHtmlChar = fulltext.replaceAll(/ /g, " ").replaceAll(/﻿/g, '');

    const nonTitle = [...`year,event\n${nonHtmlChar}`.matchAll(/.+,.*/g)].map(data => data[0]).join("\n");

    /** write to file system */
    await checkFolder(TARGET);

    await writeFile(join(TARGET, "HumanEvolutionAndActivities.csv"), nonTitle);
}();
