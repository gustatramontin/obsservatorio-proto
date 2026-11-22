import { mount } from 'svelte';
import 'leaflet/dist/leaflet.css';
import './lib/styles/tokens.css';
import './lib/styles/base.css';
import App from './App.svelte';

const app = mount(App, {
  target: document.getElementById('app'),
});

export default app;
