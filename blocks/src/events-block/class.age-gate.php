<?php

/**
 * Splicer Age Gate Plugin
 *
 * @link https://rhythmz-lounge.com
 *
 * @package WordPress
 *
 * @subpackage splicer
 *
 * @since splicer version 0.0.1
 */

namespace Rhythmz\Blocks\EventsBlock;

# define absolute path or exit
\defined( 'ABSPATH' ) || exit;

// Prevent Multiple Instances
if ( \class_exists('Rhythmz\Blocks\EventsBlock\AgeGate') ):
  return;
endif;

use Error;

use WP_Error;

class AgeGate {

  private array $config;

  public function __construct(array | object $config = []) {
    $this->config = $config;
    $this->addMetaBox();
    $this->save_age_gate();
  }

  public function addMetaBox() {
    // 1. Add the meta box
    \add_action('add_meta_boxes', function() {
      \add_meta_box(
        'event_age_range',
        'Age Range',
        array($this, 'render_age_gate'),
        'tribe_events', // post type
        'side',
        'default'
      );
    });
  }

  // 2. Render the select input
  public function render_age_gate($post) {
    $value = \get_post_meta($post->ID, '_event_age_range', true);
    $options = [
      '18+'     => 'Select age range',
      '18+'     => '18+', // adults
      '21+'     => '21+', // drinkers
      '60+'     => '60+', // seniors
      '13–17'   => '13–17', // teens
      '0–12'    => '0–12', // kids
      'All Age' => 'All Age', // general
    ];

    echo '<select name="event_age_range" id="event_age_range" class="widefat">';

    foreach ($options as $key => $label) {
      \printf(
        '<option value="%s"%s>%s</option>',
        \esc_attr($key),
        \selected($value, $key, false),
        \esc_html($label)
      );
    }

    echo '</select>';
    // Nonce for security
    \wp_nonce_field('save_event_age_range', 'event_age_range_nonce');
  }

  public function save_age_gate() {
    // 3. Save the value
    \add_action('save_post_tribe_events', function($post_id) {
      if (!isset($_POST['event_age_range_nonce']) ||
        !\wp_verify_nonce($_POST['event_age_range_nonce'], 'save_event_age_range')) {
        return;
      }

      if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

      if (isset($_POST['event_age_range'])) {
        $value = \sanitize_text_field($_POST['event_age_range']);
        \update_post_meta($post_id, '_event_age_range', $value);
      }
    });
  }
}
