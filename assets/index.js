/* global fetch */
/* global URL */
function request(api, method, body) {
    return fetch('/api/' + api, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        .then((response) => response.json());
}

function launchProject(projectName) {
    return request('launch', 'post', {
            target: projectName
        })
        .then((result) => {
            const
                hostname = new URL(document.location.href).hostname,
                port = result.succsess.data.port,
                url = `https://${hostname}:${port}/ide.html`;
            window.open(url, '_blank');
        })
        .then(() => document.location.reload());
}

function stopProject(projectName) {
    return request('launch', 'delete', {
            target: projectName
        })
        .then(() => document.location.reload());
}

function addProject(projectName, path) {
    return request('project', 'post', {
            name: projectName,
            path: path
        })
        .then(() => document.location.reload());
}

function editProject(projectName, path) {
    return request('project', 'put', {
            name: projectName,
            path: path
        })
        .then(() => document.location.reload());
}

function removeProject(projectName) {
    return request('project', 'delete', {
            name: projectName
        })
        .then(() => document.location.reload());
}

function addPort(port) {
    return request('Port', 'post', {
            number: port
        })
        .then(() => document.location.reload());
}

function removePort(port) {
    return request('Port', 'delete', {
            number: port
        })
        .then(() => document.location.reload());
}
