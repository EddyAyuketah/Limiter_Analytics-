i get this error in my terminal 

Failed to compile.
Compiled with warnings.

[eslint]
src\components\Dashboard.js
  Line 3:8:  '_' is defined but never used  no-unused-vars

src\components\TrendChart.js
  Line 55:6:  React Hook useMemo has a missing dependency: 'selectedArea'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

Search for the keywords to learn more about each warning.
To ignore, add // eslint-disable-next-line to the line before.

WARNING in [eslint]
src\components\Dashboard.js
  Line 3:8:  '_' is defined but never used  no-unused-vars

src\components\TrendChart.js
  Line 55:6:  React Hook useMemo has a missing dependency: 'selectedArea'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

webpack compiled with 1 warning

and i get this error in my react app

Uncaught runtime errors:
×
ERROR
selectedCeids.forEach is not a function
TypeError: selectedCeids.forEach is not a function
    at http://localhost:3001/main.2a8ac4f229c372bb2e0a.hot-update.js:31:19
    at Array.map (<anonymous>)
    at getTrendData (http://localhost:3001/main.2a8ac4f229c372bb2e0a.hot-update.js:27:18)
    at Dashboard (http://localhost:3001/static/js/bundle.js:82331:87)
    at react-stack-bottom-frame (http://localhost:3001/static/js/bundle.js:53345:18)
    at renderWithHooks (http://localhost:3001/static/js/bundle.js:43555:20)
    at updateFunctionComponent (http://localhost:3001/static/js/bundle.js:45248:17)
    at beginWork (http://localhost:3001/static/js/bundle.js:45834:16)
    at runWithFiberInDEV (http://localhost:3001/static/js/bundle.js:41327:68)
    at performUnitOfWork (http://localhost:3001/static/js/bundle.js:47907:93)
