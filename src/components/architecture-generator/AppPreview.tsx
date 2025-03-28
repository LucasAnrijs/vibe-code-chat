
import React, { useState, useEffect } from "react";
import { CodeArtifact } from "@/lib/agent-types";
import { AlertCircle, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface AppPreviewProps {
  artifact: CodeArtifact | null;
}

// A simple function to sanitize the JSX/TSX code
const sanitizeComponentCode = (code: string): string => {
  // Remove imports
  let sanitized = code.replace(/import\s+.*?;/g, '');
  
  // Remove exports
  sanitized = sanitized.replace(/export\s+default\s+/g, '');
  
  // Extract just the component function or class
  const componentMatch = sanitized.match(/(?:function|const)\s+(\w+)(?:\s*=\s*(?:\(\)|\(props\)|<.*>\(\)|\(\s*\{\s*.*?\s*\}\s*\))\s*=>|\s*\()/);
  if (componentMatch) {
    const componentName = componentMatch[1];
    // Return just the React component
    return `${sanitized}\n\nrender(<${componentName} />)`;
  }
  
  return sanitized;
};

const AppPreview: React.FC<AppPreviewProps> = ({ artifact }) => {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [selectedComponent, setSelectedComponent] = useState<string>("");
  const [componentOptions, setComponentOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artifact) {
      // Find all component files (TSX files)
      const components = Object.keys(artifact.files).filter(
        file => file.endsWith('.tsx') && !file.includes('index')
      );
      
      setComponentOptions(components);
      
      // Select a default component (App.tsx or the first component)
      const defaultComponent = components.find(c => c.includes('App.tsx')) || components[0];
      setSelectedComponent(defaultComponent || "");
    }
  }, [artifact]);

  const generatePreview = async () => {
    if (!artifact || !selectedComponent) {
      setError("No component selected for preview");
      return;
    }
    
    setIsRendering(true);
    setError(null);
    
    try {
      // Get the component code
      const code = artifact.files[selectedComponent];
      
      if (!code) {
        setError("Selected component not found in generated files");
        return;
      }
      
      // Sanitize the code to make it renderable
      const sanitizedCode = sanitizeComponentCode(code);
      
      // Create a simple HTML wrapper with React
      const previewHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>App Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif;
              padding: 20px;
            }
            .preview-container {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              background-color: white;
            }
          </style>
        </head>
        <body class="bg-gray-50">
          <div class="preview-container">
            <div id="root"></div>
          </div>
          
          <script type="text/babel">
            const { useState, useEffect } = React;
            const render = ReactDOM.render;
            
            // Mock components and hooks that might be imported
            const Button = (props) => <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>{props.children}</button>;
            const TextField = (props) => <input className="px-3 py-2 border rounded" {...props} />;
            const usePromptGeneration = () => ({ generate: () => Promise.resolve("Generated content"), loading: false });
            
            // Component code
            ${sanitizedCode}
          </script>
        </body>
        </html>
      `;
      
      setPreviewHtml(previewHtml);
    } catch (error) {
      console.error("Preview generation error:", error);
      setError("Failed to generate preview. The component might have dependencies that can't be resolved.");
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    if (selectedComponent) {
      generatePreview();
    }
  }, [selectedComponent]);

  if (!artifact) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 border rounded-md">
        <Play className="h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Application Generated</h3>
        <p>Generate an application from architecture first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center justify-between">
        <div>
          <label htmlFor="component-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Component to Preview
          </label>
          <select
            id="component-select"
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 px-3"
            disabled={isRendering || componentOptions.length === 0}
          >
            {componentOptions.length === 0 ? (
              <option value="">No components available</option>
            ) : (
              componentOptions.map((component) => (
                <option key={component} value={component}>
                  {component}
                </option>
              ))
            )}
          </select>
        </div>
        
        <Button 
          onClick={generatePreview} 
          disabled={isRendering || !selectedComponent}
          variant="outline"
          size="sm"
        >
          {isRendering ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Rendering...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Refresh Preview
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                Note: Only simple components can be previewed. Complex components with many dependencies may not render correctly.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden bg-white">
        <div className="bg-gray-100 border-b px-4 py-2">
          <h3 className="font-medium">Preview: {selectedComponent.split('/').pop()}</h3>
        </div>
        
        <div className="p-4">
          {isRendering ? (
            <div className="flex justify-center items-center h-[500px]">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Rendering preview...</span>
            </div>
          ) : previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              title="Component Preview"
              className="w-full h-[500px] border-0"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="flex justify-center items-center h-[500px] text-gray-500">
              Select a component to preview
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium">Preview Limitations</h4>
            <ul className="text-sm mt-1 space-y-1 list-disc pl-5">
              <li>This is a simplified preview and may not match the actual rendering</li>
              <li>Complex components with external dependencies might not render correctly</li>
              <li>Interactions between components may not be fully functional</li>
              <li>State management and API calls are simulated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPreview;
