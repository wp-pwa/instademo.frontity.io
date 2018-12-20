import React, { useContext } from 'react';
import { useObserver } from 'mobx-react-lite';
import store from '../store';

const storeContext = React.createContext(store);

const inject = (selector, baseComponent) => {
  const component = ownProps => {
    const store = useContext(storeContext);
    return useObserver(() => baseComponent(selector({ store, ownProps })));
  };
  component.displayName = baseComponent.name;
  return component;
};

export default inject;
