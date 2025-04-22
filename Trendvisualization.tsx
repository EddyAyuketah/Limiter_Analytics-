when i run: npm run start, it loads but shows up a white page and this is what my console says 

Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
dataTransformations.js:10 Uncaught TypeError: selectedCeids.forEach is not a function
    at dataTransformations.js:10:1
    at Array.map (<anonymous>)
    at getTrendData (dataTransformations.js:7:1)
    at Dashboard (Dashboard.js:357:1)
    at react-stack-bottom-frame (react-dom-client.development.js:23863:1)
    at renderWithHooks (react-dom-client.development.js:5529:1)
    at updateFunctionComponent (react-dom-client.development.js:8897:1)
    at beginWork (react-dom-client.development.js:10522:1)
    at runWithFiberInDEV (react-dom-client.development.js:1518:1)
    at performUnitOfWork (react-dom-client.development.js:15130:1)Understand this error
react-dom-client.development.js:8283 An error occurred in the <Dashboard> component.

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries.

defaultOnUncaughtError @ react-dom-client.development.js:8283Understand this warning
localhost/:1 Error while trying to use the following icon from the Manifest: http://localhost:3001/logo192.png (Download error or resource isn't a valid image)
