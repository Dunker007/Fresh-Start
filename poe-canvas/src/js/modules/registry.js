// registry.js - Simple module registry
const modules = new Map();

export function registerModule(name, module) {
    if (modules.has(name)) {
        console.warn(`Module ${name} already registered.`);
        return;
    }
    modules.set(name, module);
    console.log(`Module registered: ${name}`);
}

export function getModule(name) {
    return modules.get(name);
}

export function getAllModules() {
    return Array.from(modules.values());
}

export default { registerModule, getModule, getAllModules };
