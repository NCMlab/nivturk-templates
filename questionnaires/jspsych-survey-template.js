/* jspsych-survey-template.js
 * a jspsych plugin extension for measuring items on a likert scale
 *
 * authors: Sam Zorowitz, Dan Bennett
 *
 */

jsPsych.plugins['survey-template'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'survey-template',
    description: '',
    parameters: {
      items: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'Items',
        decription: 'The questions associated with the survey'
      },
      scale: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'Scale',
        decription: 'The response options associated with the survey'
      },
      reverse: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: true,
        pretty_name: 'Randomize Question Order',
        default: [],
        description: 'If true, the corresponding item will be reverse scored'
      },
      infrequency_items: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        pretty_name: 'Infrequency items',
        decription: 'Infrequency-check item numbers (0-indexed)',
        default: null
      },
      instructions: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Instructions',
        decription: 'The instructions associated with the survey'
      },
      randomize_question_order: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Randomize Question Order',
        default: true,
        description: 'If true, the order of the questions will be randomized'
      },
      scale_repeat: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Scale repeat',
        default: 10,
        description: 'The number of items before the scale repeats'
      },
      survey_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Survey width',
        default: 900,
        description: 'The number of pixels occupied by the survey'
      },
      item_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Item width',
        default: 50,
        description: 'The percentage of a row occupied by an item text'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to finish the trial.'
      },
    }
  }
  plugin.trial = function(display_element, trial) {

    //---------------------------------------//
    // Define survey HTML.
    //---------------------------------------//

    // Initialize HTML
    var html = '';

    // Define CSS constants
    const n  = trial.scale.length;              // Number of item responses
    const x1 = trial.item_width;                // Width of item prompt (percentage)
    const x2 = (100 - trial.item_width) / n;    // Width of item response (percentage)

    // Insert CSS
    html += `<style>
    .survey-template-wrap {
      height: 100vh;
      width: 100vw;
    }
    .survey-template-instructions {
      width: ${trial.survey_width}px;
      margin: auto;
      font-size: 16px;
      line-height: 1.5em;
    }
    .survey-template-container {
      display: grid;
      grid-template-columns: ${x1}% repeat(${n}, ${x2}%);
      grid-template-rows: auto;
      width: ${trial.survey_width}px;
      margin: auto;
      background-color: #F8F8F8;
      border-radius: 8px;
    }
    .survey-template-row {
      display: contents;
    }
    .survey-template-row:hover div {
      background-color: #dee8eb;
    }
    .survey-template-header {
      padding: 18px 0 0px 0;
      text-align: center;
      font-size: 14px;
      line-height: 1.15em;
    }
    .survey-template-prompt {
      padding: 12px 0 12px 15px;
      text-align: left;
      font-size: 15px;
      line-height: 1.15em;
      justify-items: center;
    }
    .survey-template-response {
      padding: 12px 0 12px 0;
      font-size: 13px;
      text-align: center;
      line-height: 1.15em;
      justify-items: center;
    }
    .survey-template-response input[type='radio'] {
      position: relative;
      width: 16px;
      height: 16px;
    }
    .survey-template-response .pseudo-input {
      position: relative;
      height: 0px;
      width: 0px;
      display: inline-block;
    }
    .survey-template-response .pseudo-input:after {
      position: absolute;
      left: 6.5px;
      top: -6px;
      height: 2px;
      width: calc(${trial.survey_width}px * ${x2 / 100} - 100%);
      background: #d8dcd6;
      content: "";
    }
    .survey-template-response:last-child .pseudo-input:after {
      display: none;
    }
    .survey-template-footer {
      margin: auto;
      width: ${trial.survey_width}px;
      padding: 0 0 0 0;
      text-align: right;
    }
    .survey-template-footer input[type=submit] {
      background-color: #F0F0F0;
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      margin-top: 5px;
      margin-bottom: 20px;
      margin-right: 0px;
      font-size: 13px;
      color: black;
    }
    </style>`;

    // Initialize survey.
    html += '<div class="survey-template-wrap"><form name="survey-template" id="survey-template-submit">';

    // Add instructions.
    html += '<div class="survey-template-instructions" id="instructions">';
    html += `<p>${trial.instructions}<p>`;
    html += '</div>';

    // Randomize question order.
    var item_order = [];
    for (var i=0; i < trial.items.length; i++){ item_order.push(i); }
    if(trial.randomize_question_order){

      // Shuffle item order
      item_order = jsPsych.randomization.shuffle(item_order);

      // check if the first item is an infrequency item; if so, re-shuffle to avoid this
      while (!(trial.infrequency_items === null) && trial.infrequency_items.toString().includes([item_order[0]])){
        item_order = jsPsych.randomization.shuffle(item_order);
      }

    }

    // Iteratively add items.
    html += '<div class="survey-template-container">';

    for (var i = 0; i < trial.items.length; i++) {

      // Define item ID.
      const qid = ("0" + `${item_order[i]+1}`).slice(-2);

      // Define response values.
      var values = [];
      for (var j = 0; j < trial.scale.length; j++){ values.push(j); }
      if (trial.reverse[item_order[i]]) { values = values.reverse(); }

      // Add response headers (every N items).
      if (i % trial.scale_repeat == 0) {
        html += '<div class="survey-template-header"></div>';
        for (var j = 0; j < trial.scale.length; j++) {
          html += `<div class="survey-template-header">${trial.scale[j]}</div>`;
        }
      }

      // Add row.
      html += '<div class="survey-template-row">';
      html += `<div class='survey-template-prompt'>${trial.items[item_order[i]]}</div>`;
      for (var j = 0; j < values.length; j++) {
        html += '<div class="survey-template-response">';
        html += '<div class="pseudo-input"></div>';
        html += `<input type="radio" name="Q${qid}" value="${values[j]}" id=${j} required>`;
        html += "</div>";
      }
      html += '</div>';

    }
    html += '</div>';

    // Add submit button.
    html += '<div class="survey-template-footer">';
    html += `<input type="submit" value="${trial.button_label}"></input>`;
    html += '</div>';

    // End survey.
    html += '</form></div>';

    // Display HTML
    display_element.innerHTML = html;

    //---------------------------------------//
    // Response handling.
    //---------------------------------------//

    // Scroll to top of screen.
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    }

    // Preallocate space.
    var key_events = [];
    var mouse_events = [];
    var radio_events = [];

    // Add event listener.
    function log_event(event) {
      const response_time = performance.now() - startTime;
      if (event.screenX > 0) {
        mouse_events.push( response_time );
      } else {
        key_events.push( response_time );
      }
      if (event.target.type == "radio") {
        radio_events.push( response_time )
      }
    }
    document.addEventListener("click", log_event);

    display_element.querySelector('#survey-template-submit').addEventListener('submit', function(event) {

        // Wait for response
        event.preventDefault();

        // Measure response time
        var endTime = performance.now();
        var response_time = endTime - startTime;

        // Serialize data
        var question_data = serializeArray(this);

        // Extract responses
        var responses = objectifyForm(question_data);

        // Detect heuristic responding
        var straightlining = detectStraightLining(question_data);
        var zigzagging = detectZigZagging(question_data, trial.scale);

        // Store data
        var trialdata = {
          "responses": responses,
          "rt": response_time,
          "item_order": item_order,
          "radio_events": radio_events,
          "key_events": key_events,
          "mouse_events": mouse_events,
          "straightlining": straightlining,
          "zigzagging": zigzagging
        };

        // Remove event listener
        document.removeEventListener("click", log_event);

        // Update screen
        display_element.innerHTML = '';

        // Move onto next trial
        jsPsych.finishTrial(trialdata);

    });

    var startTime = performance.now();

  };

  /*!
   * Serialize all form data into an array
   * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {Node}   form The form to serialize
   * @return {String}      The serialized form data
   */
  var serializeArray = function (form) {
    // Setup our serialized data
    var serialized = [];

    // Loop through each field in the form
    for (var i = 0; i < form.elements.length; i++) {
      var field = form.elements[i];

      // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
      if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;

      // Convert field data to a query string
      if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
        serialized.push({
          name: field.name,
          position: field.id,
          value: field.value,
        });
      }

    }

    return serialized;
  };

  // from https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
  function objectifyForm(formArray) {//serialize data function
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
      returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  // Straight-lining is defined as choosing the same response option (by position)
  // across the entire survey. We detect this pattern by identifying the maximum
  // percentage of responses loading onto the same item position.
  function detectStraightLining(formArray) {

    // Initialize counts
    let counts = [];

    // Count number of instances per unique response
    for (let i = 0; i < formArray.length; i++) {
      let loc = parseInt(formArray[i]['position']);
      if ( counts[loc] > 0 ) {
        counts[loc]++;
      } else {
        counts[loc] = 1;
      }
    }

    // Error-catching: replace empty with zero.
    counts = Array.from(counts, item => item || 0);

    // Compute and return maximum fraction
    return Math.max(...counts) / formArray.length;

  }

  // Zig-zagging is defined as choosing adjacent response options (by position)
  // such that a diagonal pattern emerges across responses (i.e. the zig-zag).
  // We detect this pattern by identifying the fraction of responses that exhibit
  // response adjacency (including wrapping).
  function detectZigZagging(formArray, scale) {

    // Initialize score
    let score = 0;

    // Compute distance between adjacent responses
    for (let i = 0; i < formArray.length-1; i++) {
      let a = parseInt(formArray[i]['position']);
      let b = parseInt(formArray[i+1]['position']);
      let delta = Math.abs(a - b);
      if ( delta == 1 || delta == (scale.length-1) ) { score++ };
    }

    // Compute and return fraction
    return score / (formArray.length-1);

  }

  return plugin;

})();
