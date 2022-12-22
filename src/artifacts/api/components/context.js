import AlertProvider from "./alert/context";

function ApiProvider({ children }) {
    return (
        <AlertProvider>
            {children}
        </AlertProvider>
    )
}

export default ApiProvider;
