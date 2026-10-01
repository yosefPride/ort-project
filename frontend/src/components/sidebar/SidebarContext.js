import { createContext } from 'react';

// Lets every row know whether the sidebar is collapsed, without passing it through each component.
export const SidebarContext = createContext({ collapsed: false, expand: () => {}, onNavigate: () => {} });
