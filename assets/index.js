/* global addProject */
const
  projectName = document.getElementById('project-name'),
  projectPath = document.getElementById('project-path');

document.getElementById('add-workspace').onclick = () => {
  addProject(projectName.value, projectPath.value)
}
