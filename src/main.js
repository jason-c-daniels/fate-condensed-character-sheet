import App from './App';

const app = new App({
	target: document.body,
	props: {
		appSettings: { applicationName: "Fate Condensed" }
	}
});

export default app;