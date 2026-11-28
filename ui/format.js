import { BUGS } from '../app/bugs.js';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

export const escapeHtml = (text) => text.replace(/[&<>]/g, (c) => HTML_ESCAPES[c]);

export const bugName = (id) => (BUGS.find((b) => b.id === id) || { name: 'Uncatalogued failure' }).name;

export const mean = (values) => values.reduce((sum, v) => sum + v, 0) / (values.length || 1);
