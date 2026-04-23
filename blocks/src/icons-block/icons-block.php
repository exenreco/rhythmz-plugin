<?php
/**
 * Plugin Name: Icons Block
 * Plugin Slug: rhythmz/icons-block
 * Description: A simple Gutenberg block that displays "Hello, World!".
 * Version:     1.0.0
 * Author:      Exenreco Bell
 * Author URI:  https://exenreco.com
 * Text Domain: rhythmz-plugin
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */
namespace Rhythmz\Blocks\IconsBlock;

#\defined( 'ABSPATH' ) || exit;

#\define( 'TEXT_DOMAIN', 'rhythmz' ) || exit;

#\define( 'BLOCK_NAME', 'icons-block' ) || exit;

use Error;

use WP_Error;

// When WP add_action function not found
if (! \function_exists('\add_action') ):
  $msg = \esc_html__("@Icons Block: no such function 'add_action'.", 'rhythmz-plugin');
  new Error("$msg");
  new WP_Error("$msg");
endif;

// When WP register_block_type_from_metadata function not found
if (! \function_exists('\register_block_type_from_metadata') ):
  $msg = \esc_html__("@Icons Block: no such function 'register_block_type_from_metadata'.", 'rhythmz-plugin');

  \add_action('admin_notices', function() use ($msg) {
    echo '<div class="notice notice-error is-dismissible"><p>' . $msg . '</p></div>';
  });

  new Error("$msg");
  new WP_Error("$msg");
endif;

/**
 * registerIconsBlock
 * @return void
 */
function registerIconsBlock() {
  $blockDir = \plugin_dir_path( \str_replace('\\', '/', \trailingslashit(__FILE__) ) );
  \register_block_type_from_metadata($blockDir);
}

/**
 * Initialize the Icons Block
 * @return void
 */
function iconsBlockInit() {
  \add_action( 'init', __NAMESPACE__ . '\\registerIconsBlock' );
}
