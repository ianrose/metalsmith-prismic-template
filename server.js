#!/usr/bin/env node
'use strict';

var layouts = require('metalsmith-layouts');
var autoprefixer = require('metalsmith-autoprefixer');
var markdown = require('metalsmith-markdown');
var beautify = require('metalsmith-beautify');
var ignore = require('metalsmith-ignore');
var discoverPartials = require('metalsmith-discover-partials');
var sass = require('metalsmith-sass');

var cons = require('consolidate');
var handlebars = require('handlebars');

var metalsmithPrismicServer = require('metalsmith-prismic-server');
var config = metalsmithPrismicServer.cliConfig;

function run() {
  handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context);
  });

  // Configure prismic links
  // *TEMPLATE* adjust this example function to suit your prismic content and folder structures
  config.prismicLinkResolver = function(ctx, doc) {
    if (doc.isBroken) {
      return;
    }
    switch (doc.type) {
      case 'home':
        return 'index.html';

      case 'i18n-example':
        var languageTag = doc.tags[0]; //TODO
        var language = '';
        if (languageTag) {
          languageTag = languageTag.split(':');
          language = languageTag ? '/' + languageTag[1] : '';
        }

        return language + '/' + 'index.html';
      default:
        return '/' + doc.type + '/' +  (doc.uid || doc.slug) + '/index.html';
    }
  };

  // Metalsmith plugins
  // *TEMPLATE* switch out any plugins to fit your setup
  var plugins = {
    common: [
      // Render markdown files to html
      markdown(),
      // Render with handlebars templates
      layouts({
        engine: 'handlebars',
        directory: 'layouts',
        partials: 'partials',
        //default: 'base.handlebars',
        pattern: '**/*.html'
      }),
      // Style using sass
      sass({
        outputDir: 'style/'
      }),
      // Autoprefix styles
      autoprefixer({
        // Supporting browsers based on these versions
        browsers: ['last 2 versions',
                   '> 5%']
      }),
      // Make output pretty
      beautify({
        indent_size: 2,
        indent_char: ' ',
        wrap_line_length: 0,
        end_with_newline: true,
        css: true,
        html: true
      }),
      // Ignore some superfluous files
      ignore([
        '**/*.scss'
      ])
    ],
    dev: [],
    preview: [],
    build: []
  };

  // Start server
  var app = metalsmithPrismicServer.server(plugins, config);
  app.listen();
}

if (require.main === module) {
  // Only run server if run from script
  run();
}
