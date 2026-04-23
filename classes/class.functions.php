<?php

namespace Rhythmz\Plugin\Functions;

use WP_Error;

if ( \class_exists('Rhythmz\\Plugin\\Functions') ):
  return;
endif;

class Functions {

  public function __construct() {}

  public function getRootDir() {
    if( ! \function_exists('plugin_dir_path') ):
      throw new WP_Error('Error(RPF): Failed to locate WP plugin dir function @RhythmzPlugin/functions->getRootDir');
      return;
    endif;
    return plugin_dir_path( \str_replace('\\', '/', __DIR__) );
  }

  /*
  * Registers all blocks found in the current directory.
  * This function will look for block.json files in each subdirectory.
  */
  public function registerAllBlocks() {
    if ( ! \function_exists( 'register_block_type_from_metadata' ) ):
      return; // Block registration function not available.
    endif;

    $pluginRoot = $this->getRootDir();

    $build_dir = ( $pluginRoot && \is_string($pluginRoot) )
    ? $pluginRoot . 'blocks' : null;

    if ( ! \is_dir( $build_dir ) ) {
      return; // nothing built yet
    }

    // Find each subdirectory under build/
    $block_dirs = \glob( $build_dir . '/*', GLOB_ONLYDIR );

    foreach ( $block_dirs as $dir ) {

      $metadata = $dir . '/block.json';

      if ( ! \file_exists( $metadata ) ) {
        continue;
      }

      // Register this block from its own metadata file
      \register_block_type_from_metadata( $metadata );
    }
  }
}
