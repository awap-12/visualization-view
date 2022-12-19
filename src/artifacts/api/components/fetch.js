import { useEffect, useState } from "react";
import useFallback from "./fallback";

async function handleJsonResponse(response) {
    const json = await response.json();

    return { state: response.ok ? "success" : "fail", data: json };
}

async function handleTextResponse(response) {
    const text = await response.text();

    return { state: response.ok ? "success" : "fail", data: text };
}

async function handleResponse(response) {
    let contentType = response.headers.get("content-type");

    switch (true) {
        case contentType.includes("json"):
            return await handleJsonResponse(response);
        case contentType.includes("text"):
            return await handleTextResponse(response);
        default:
            throw new Error(`Unknown content type ${contentType}`);
    }
}

function useFetch(url, option) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { warning } = useFallback();

    useEffect(() => {
        setLoading(true);

        void async function() {
            try {
                const response = await fetch(url, option)

                const { state, data } = await handleResponse(response);

                switch (state) {
                    case "success":
                        setData(data);
                        break;
                    case "fail":
                        setError(data);
                        break;
                    default:
                        setError(`Unknown state ${state}`);
                        break;
                }
            } catch (err) {
                setError(err.message);
            }

            setLoading(false);
        }();
    }, [url, option]);

    useEffect(() => {
        if (!!error)
            warning(error);
    }, [error, warning]);

    return { data, error, loading };
}

export default useFetch;
