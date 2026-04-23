<?php

/**
 * Events Block Admin
 *
 * @link https://rhythmz-lounge.com
 *
 * @package WordPress
 *
 * @subpackage eventsBlock
 *
 * @since eventsBlock version 0.0.1
 */

namespace Rhythmz\Blocks\EventsBlock;

# define absolute path or exit
\defined( 'ABSPATH' ) || exit;

// Prevent Multiple Instances
if ( \class_exists('\\Rhythmz\\Blocks\\EventsBlock\\Admin') ):
  return;
endif;

use Error;

use WP_Error;

class Admin {
  public function __construct() {
    $this->add_admin_pages();
  }

  public function add_admin_pages()
  {
    add_action('admin_menu', array($this, 'register_custom_admin_menu'), 30);
  }

  public function register_custom_admin_menu() {
    if($this->hasTopLevelAdminPage('rhythmz_theme')):
        if(!$this->hasSubmenuAdminPage('rhythmz_theme', 'events_block')):
            \add_submenu_page(
                'rhythmz_theme',
                'Events Block',
                'Events Block',
                'manage_options',
                'events_block',
                array($this, 'eventsBlockAdminPage'),
                7
            );
        endif;
    endif;
  }

  // Check if a top-level menu page with a given slug exists
  public function hasTopLevelAdminPage( $menu_slug ) {
    global $menu;
    foreach ( $menu as $menu_item ) {
      if ( isset( $menu_item[2] ) && $menu_item[2] === $menu_slug ) {
        return true;
      }
    }
    return false;
  }

  // Check if a submenu page with a given parent slug and submenu slug exists
  public function hasSubmenuAdminPage( $parent_slug, $submenu_slug ) {
    global $submenu;
    if ( isset( $submenu[ $parent_slug ] ) ) {
      foreach ( $submenu[ $parent_slug ] as $submenu_item ) {
        if ( isset( $submenu_item[2] ) && $submenu_item[2] === $submenu_slug ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Renders the tab menu for the admin page.
   *
   * @param array $tabs An associative array of tabs, where key is the tab slug and value is the tab title.
   * @param string $current_tab The slug of the currently active tab.
   */
  private function render_tabs( $tabs, $current_tab ) {
    echo '<h2 class="nav-tab-wrapper">';
    foreach ( $tabs as $tab_slug => $tab_title ) {
      $class = ( $tab_slug === $current_tab ) ? ' nav-tab-active' : '';
      echo '<a class="nav-tab' . esc_attr( $class ) . '" href="?page=events_block&tab=' . esc_attr( $tab_slug ) . '">' . esc_html( $tab_title ) . '</a>';
    }
    echo '</h2>';
  }

  public function eventsBlockAdminPage() {
    $current_tab = isset( $_GET['tab'] ) ? sanitize_text_field( $_GET['tab'] ) : 'general';

    $tabs = array(
      'general' => 'General Settings',
      'slides'  => 'Manage Slides',
      'advanced' => 'Advanced Settings',
    );

    $output = '';

    $output .= '<div class="wrap">';
    $output .= '<h1>Events Block Settings</h1>';

    $this->render_tabs( $tabs, $current_tab );

    $output .= '<div class="tab-content">';
    switch ( $current_tab ) {
      case 'general':
        $output .= '<h2>General Settings</h2>';
        $output .= '<p>Configure general settings for the events block here.</p>';
        // Add your general settings form fields here
        break;
      case 'slides':
        $output .= '<h2>Manage Slides</h2>';
        $output .= '<p>Add, edit, or remove slides for the events block.</p>';
        $output .= $this->manageSlides();
        // Add your slide management interface here
        break;
      case 'advanced':
        $output .= '<h2>Advanced Settings</h2>';
        $output .= '<p>Access advanced configuration options for the events block.</p>';
        // Add your advanced settings form fields here
        break;
      default:
        $output .= '<h2>General Settings</h2>';
        $output .= '<p>Configure general settings for the events block here.</p>';
        break;
    }
    $output .= '</div>'; // .tab-content
    $output .= '</div>'; // .wrap

    echo $output;
    return;
  }
  public function manageSlides() {
    $content = "
    <style>
      #slides {
        width: 100%;
        max-width: 100%;
        min-width: 100%;
        display: flex;
        flex: 0 0 auto;
        align-items: start;
        flex-direction: row;
        justify-items: left;
        justify-content: left;
      }
      #slides .container {
        width: 100%;
        max-width: 100%;
        min-width: 100%;
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        flex-direction: row;
        justify-items: center;
        justify-content: center;
      }
      #slides .left,
      #slides .right {
        display: flex;
        flex: 0 0 auto;
        align-items: start;
        flex-direction: column;
        justify-items: left;
        justify-content: left;
      }
      #slides .left {
        width: calc(100% - 30%);
        max-width: calc(100% - 30%);
        min-width: calc(100% - 30%);
        background: red;
      }
      #slides .right {
        width: 30%;
        max-width: 30%;
        min-width: 30%;
        background: green;
      }
        #slides .left .add-slide {
        width: 20rem;
        max-width: 20rem;
        min-width: 20rem;
        height: 20rem;
        max-height: 20rem;
        min-height: 20rem;
        background: blue;
        border-radius: 20px;
        border: 1px solid #000;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
    <main id='slides'>
      <div class='container'>
        <div class='slides left'>
          <button 
            class='add-slide' 
            rel='noopener noreferrer'
            type='button'
            title='Add Slide'
            tabindex='0'>
            Add Slide
          </button>
        </div>
        <div class='properties right'>
          <div class='properties-header'>
            <h2>Slide Properties</h2>
          </div>
          <div class='properties-body'>
            <h2>Slide Properties</h2>
          </div>
        </div>
      </div>
    </main>
  ";
    return $content;
  }
}
