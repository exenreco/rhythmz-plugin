<?php
/**
 * Plugin Name: Rhythmz
 * Plugin Slug: rhythmz
 * Plugin URI: https://example.com/rhythmz
 * Description: Registers all blocks and handles activation/deactivation.
 * Version: 1.0.0
 * Author: Exenreco Bell
 * Author URI: https://exereco.com
 * Text Domain: rhythmz-plugin
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

namespace Rhythmz\Plugin;

\defined( 'ABSPATH' ) || exit;

// Activation callback: run on plugin activation
\define( 'RHYTHMZ_PLUGIN_PATH', __DIR__ );

// Deactivation callback: run on plugin deactivation
\define( 'RHYTHMZ_PLUGIN_SETUP_FILE', __FILE__ );


// plugin slug
$baseSlug = 'rhythmz';

// plugin base folder
$basePath = \plugin_dir_path( \str_replace('\\', '/', \trailingslashit(__DIR__) . $baseSlug) );

// requires plugin functions class
require_once $basePath . \trailingslashit('classes') . 'class.functions.php';

// requires plugin setup class
require_once $basePath . \trailingslashit('classes') . 'class.setup.php';




use WP_Error;

use \Rhythmz\Plugin\Setup\Setup as Setup;

use \Rhythmz\Plugin\Functions\Functions as Functions;



// initialize plugin functions
$Functions = new Functions();

// initialize plugin setup
$Plugin = new Setup('rhythmz', (Object) [
  'settings' => array(
    'plugin-color' => '#ffffff'
  )
]);

// get plugin state
$pluginState = $Plugin->getPluginState();


switch( $pluginState ) {

  case true: // plugin is active

    // allow deactivation hook to clean up
    if ( \function_exists('WP\\register_deactivation_hook') ):
      \register_deactivation_hook( __FILE__, $Plugin->deactivate() );
    endif;

    // allow plugin to load text domain
    if ( \function_exists( 'load_plugin_textdomain' ) ): // load text domain
      \load_plugin_textdomain( 'rhythmz-plugin', false, \dirname( \plugin_basename(__FILE__) ) . '/languages' );
    endif;

    // enqueue plugin block editor script
    \add_action( 'enqueue_block_editor_assets', function() {

      /*\wp_enqueue_script(
        'rhythmz-plugin-angular-vendor',
        \plugin_dir_url( __FILE__ ) . 'assets/components/vendors.bundle.js',
        ['wp-blocks', 'wp-element', 'wp-components', 'wp-i18n', 'wp-editor'],
        '1.0.0'
      );

      \wp_enqueue_script(
        'rhythmz-plugin-angular',
        \plugin_dir_url( __FILE__ ) . 'assets/components/angular.bundle.js',
        ['rhythmz-plugin-angular-vendor'],
        '1.0.0'
      );*/

      /*\wp_enqueue_script(
        'rhythmz-plugin-angular',
        \plugin_dir_url( __FILE__ ) . 'assets/components/popup-block.bundle.js',
        [],
        '1.0.0'
      );*/

    }, 10 );

    // Register all blocks on init
    //\add_action( 'init',  [$Functions, 'registerAllBlocks'], 10);
    \add_action( 'init',  function() use ( $Functions ) {
      $Functions->registerAllBlocks();
    }, 10);

  break;


  case false: // plugin is inactive

    // allow activation hook to set up initial options
    if( \function_exists('WP\\register_activation_hook') ):
      \register_activation_hook( __FILE__, $Plugin->activate() );
    endif;

  break;

  default: // can't determine plugin state

    // throw an error
    new WP_Error(`
      Error(RP:001) - An error Occurred in the Rhythmz plugin,
      the plugin has come to an halt!
    `);

    // then exit
    exit;
}


# Setup 3D Block
require_once $basePath . \trailingslashit('blocks/build') . 'three-d-block/three-d-block.php';
use \Rhythmz\Blocks\ThreeDBlock as ThreeDBlock;
if( \function_exists('Rhythmz\\Blocks\\ThreeDBlock\\init_3D_Block') ):
  ThreeDBlock\init_3D_Block();
endif;



# Setup Ticket Gen
/*if (is_admin()) {
  add_action('current_screen', function ($screen) use ($basePath) {
    if (! $screen || $screen->post_type !== 'tribe_events') return;
    require_once $basePath . \trailingslashit('blocks/build') . 'events-block/ticket.gen.php';
  });
}*/

# Setup Events Block
require_once $basePath . \trailingslashit('blocks/build') . 'events-block/events-block.php';
use \Rhythmz\Blocks\EventsBlock as EventsBlock;
if( \function_exists('Rhythmz\\Blocks\\EventsBlock\\init_Events_Block') ):
  EventsBlock\init_Events_Block();
endif;



# Setup Icons Block
require_once $basePath . \trailingslashit('blocks/build') . 'icons-block/icons-block.php';
use \Rhythmz\Blocks\IconsBlock as IconsBlock;
if( \function_exists('Rhythmz\\Blocks\\IconsBlock\\iconsBlockInit') ):
  IconsBlock\iconsBlockInit();
endif;
