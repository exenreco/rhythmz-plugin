<?php

namespace Rhythmz\Plugin\Setup;

if ( \class_exists('Rhythmz\\Plugin\\Setup') ):
  return;
endif;


class Setup {

  private string $namespace = 'rhythmz';

  private array $pluginSettings;

  public function __construct(string $namespace = 'rhythmz', object|array $config = ['settings' => []]) {
    // update namespace when valid
    if( $namespace && \is_string($namespace) ):
      $this->namespace = $namespace;
    endif;

    // set default settings
    $this->pluginSettings = array(
      'initialized' => true
    );

    // add new plugin settings
    $this->addPluginSettings($config);

    return;
  }

  public function deactivate() {
    // Clean up scheduled tasks or custom tables if any
    \delete_option($this->namespace.'_plugin_settings' );

    // flush rewrite rules to remove CPT endpoints
    \flush_rewrite_rules();
  }

  public function activate() {
    // Set up plugin default options
    if ( \get_option($this->namespace."_plugin_settings" ) === false ):
      \add_option($this->namespace."_plugin_settings", $this->pluginSettings );
    endif;

    // If you register custom post types or rewrite rules in blocks,
    // call flush_rewrite_rules to ensure permalinks work
    \flush_rewrite_rules();
  }

  /**
   * Get Plugin State
   *
   * Determines if the plugin is active or not.
   *
   * @param void
   *
   * @method getPluginState()
   *
   * @return boolean - {
   *    - returns True when the plugin is active
   *    - otherwise returns False
   * }
   *
   * @since version 0.0.1
   *
   * @author Exenreco Bell <exenreco@yahoo.com>
   */
  public function getPluginState() {
    // Include the WP Admin plugin functions if needed
    if ( ! \function_exists( 'is_plugin_active' ) ):
      require_once ABSPATH . 'wp-admin/includes/plugin.php';
    endif;

    return (\is_plugin_active( $this->namespace.'-plugin/'.$this->namespace.'-plugin.php'))
    ? true // plugin is active
    : false; // plugin is inactive
  }

  public function addPluginSettings( object | array $settings = [] ) {

    if( ! $settings  ):
      throw new \WP_Error(`
        Error(RPS-001): A call was made to add a new settings to the Rhythmz plugin,
        but an invalid param was given.
      `);
    endif;

    $_settings = ( \is_array($settings) )
    ? (object) $settings // convert to an object
    : $settings;  // already object

    if( $_settings ):
      $this->pluginSettings = $this->mergeSettings($this->pluginSettings, $_settings);
      return true;
    else:
      return false;
    endif;

  }

  private function mergeSettings(object|array $collectionOne, object|array $collectionTwo) {
    // Convert objects to arrays
    $arr1 = \is_object($collectionOne) ? (array)$collectionOne : $collectionOne;
    $arr2 = \is_object($collectionTwo) ? (array)$collectionTwo : $collectionTwo;

    // Accept both arrays and objects as items
    $validFirstSet = \array_filter($arr1, function($settings) {
      return (( $settings ));
    });
    $validSecondSet = \array_filter($arr2, function($settings) {
      return (( $settings ));
    });

    // Merge, even if one is empty
    $newCollection = \array_merge($validFirstSet, $validSecondSet);

    return (Array) $newCollection;
  }
}
