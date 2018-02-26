const fs = require('fs');

const getFilesInDirectory = async ({directory}) => {
    return new Promise((resolve) => {
        fs.readdir(directory, (err, files) => {
            resolve(files);
        });
    });
};

const getComponentName = ({componentName, componentFile}) => {
    if (typeof componentName === 'string') {
        return componentName;
    }
    else if (typeof componentName === 'function') {
        const name = componentName(componentFile);
        if (typeof name === 'string') {
            return name;
        }
        throw new Error ('Component name function must return a string.');
    }
    throw new Error ('Component name must be a string or function.');
};

const getComponents = async ({directory, test, componentName}) => {
    const filesInSrcDirectory = await getFilesInDirectory({directory});

    const matchedComponentFiles = filesInSrcDirectory.filter((file) => {
        return typeof test === 'function' ? test(file) : test.test(file);
    });

    const components = matchedComponentFiles.map((componentFile) => {
        const name = getComponentName({componentName, componentFile});
        return {
            name: name,
            file: componentFile
        }
    });

    return components;
};

module.exports = getComponents;
