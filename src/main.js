import App from './App';

const app = new App({
	target: document.body,
	props: {
		appSettings: { applicationName: "Svelte PostCSS Demo App" }
	}
});

export default app;