# Data Management and Visualization for Benchmarking Deep Learning Training Systems Frontend
This is the frontend for the framework. Keep in mind that without the backend this service might not work properly.
The frontend is a react app that can be hosted on a separate server or on the same server.

## Before building

You should specify the location of the REST api in the `.env` file for the visualization environment to work. This will ordinarily be the `3000` port on the server
you are running docker compose on and should be the outward facing address. Setting this to localhost will limit functionality to thuat machine. E.g.:

```
REACT_APP_API_URL=http://localhost:3000/
```
## Docker

Run the following command in this directory to build the container:

```bash
docker build . -t radt-frontend
```

## Manually

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.
