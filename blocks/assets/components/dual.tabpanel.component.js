import { cog, styles } from "@wordpress/icons";
import { TabPanel, Icon } from "@wordpress/components";

/**
 * Reusable TabPanel for Block Settings
 *
 * @param {ReactNode} settingsControls - Controls for the 'Settings' tab (param 2)
 * @param {ReactNode} styleControls    - Controls for the 'Styles' tab (param 1)
 */
const DualTabPanel = ({ settingsControls, styleControls }) => {
  // Define tabs dynamically based on which props are passed
  const tabs = [
    settingsControls && {
      name: "settings",
      title: (
        <span className="tab-title">
          <Icon icon={cog} />
          <span className="screen-reader-text">Settings</span>
        </span>
      ),
      className: "tab-settings",
    },
    styleControls && {
      name: "styles",
      title: (
        <span className="tab-title">
          <Icon icon={styles} />
          <span className="screen-reader-text">Styles</span>
        </span>
      ),
      className: "tab-styles",
    },
  ].filter(Boolean); // Removes undefined/null tabs

  // If no controls are passed, render nothing
  if (tabs.length === 0) {
    return null;
  }

  return (
    <TabPanel className="icons-block-tabs" activeClass="is-active" tabs={tabs}>
      {(tab) => (
        <>
          {tab.name === "settings" && settingsControls}
          {tab.name === "styles" && styleControls}
        </>
      )}
    </TabPanel>
  );
};

export { DualTabPanel };
