const CONTENT_DIRECTORY = 'contents/';
const CONFIG_FILE = 'config.yml';
const SECTION_NAMES = ['home', 'publications', 'awards'];

function setConfigValues(config) {
    Object.entries(config).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (!element) {
            return;
        }

        if (id === 'copyright-text') {
            element.innerHTML = value;
        } else {
            element.textContent = value;
        }
    });
}

async function loadText(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Unable to load ${path} (${response.status})`);
    }

    return response.text();
}

async function loadConfig() {
    const yaml = await loadText(CONTENT_DIRECTORY + CONFIG_FILE);
    setConfigValues(jsyaml.load(yaml));
}

async function loadSection(name) {
    const markdown = await loadText(`${CONTENT_DIRECTORY}${name}.md`);
    const target = document.getElementById(`${name}-md`);
    target.innerHTML = marked.parse(markdown);
}

window.addEventListener('DOMContentLoaded', async () => {
    marked.use({ mangle: false, headerIds: false });

    const tasks = [loadConfig(), ...SECTION_NAMES.map(loadSection)];
    const results = await Promise.allSettled(tasks);

    results.forEach((result) => {
        if (result.status === 'rejected') {
            console.error(result.reason);
        }
    });
});
