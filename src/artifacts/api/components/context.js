import { GraphicProvider } from "graphic";
import { AlertProvider, BreakpointProvider } from "shared";

function ApiProvider({ children }) {
    return (
        <BreakpointProvider>
          <GraphicProvider>
            <AlertProvider>
                {children}
            </AlertProvider>
          </GraphicProvider>
        </BreakpointProvider>
    );
}

export default ApiProvider;
