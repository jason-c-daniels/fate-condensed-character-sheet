import App from './App';

const app = new App({
	target: document.body,
	props: {
		appSettings: { applicationName: "Fate Condensed Character Editor" }
	}
});

export default app;