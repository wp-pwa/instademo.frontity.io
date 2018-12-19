import { flow } from 'mobx-state-tree';
import tasks from './tasks';

const taskActions = tasks.reduce((actions, task) => {
  actions[task.name] = task.func;
  return actions;
}, {});

console.log(taskActions);

export default self => ({
  runTasks: flow(function* checkAPI() {
    try {
      for (let { name, func } of tasks) {
        yield self.runTask(name, func);
      }
    } catch (error) {
      console.warn(error);
    }

    if (self.error) return;
  }),
  runTask: flow(function* runTask(name, task) {
    self.setStatus(name, 'busy');
    const error = yield self[name](self);
    if (error) {
      self.setStatus(name, 'error', error);
      throw new Error(self.error);
    }
    self.setStatus(name, 'ok');
  }),
  // add tasks as actions
  ...taskActions,
});
