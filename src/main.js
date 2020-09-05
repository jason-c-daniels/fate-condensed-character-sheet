import App from './App';

const app = new App({
	target: document.body,
	props: {
		appSettings: { applicationName: "Fate Condensed Character Sheet" }
	}
});

export default app;