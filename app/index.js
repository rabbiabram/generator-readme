'use strict';

var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var gitConfig = require('git-config');
var fs = require('fs');
var p = require('path');
var _ = require('lodash');
var parser = require('./parser/parser');

var ReadmeGenerator = yeoman.generators.Base.extend({
  init: function() {
    this.author = this.email = this.githubUser = '';
    this.year = new Date().getFullYear();

    var done = this.async();
    gitConfig(function(err, config) {
      if(err) {
        return done();
      }
      this.author = config.user.name;
      this.email = config.user.email;
      this.githubUser = null;
      if (config.github && config.github.user) {
        this.githubUser = config.github.user;
      }
      done();
    }.bind(this));
  },

  askFor: function() {
    var done = this.async();

    this.log(yosay('Welcome to the marvelous Readme generator!'));
    var self = this;

    var prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is your project called?',
        default: this.appname
      },
      {
        type: 'input',
        name: 'description',
        message: 'Briefly describe the project'
      },
      {
        type: 'input',
        name: 'author',
        message: 'What is your full name?',
        default: this.author
      },
      {
        type: 'input',
        name: 'email',
        message: 'What is your email address?',
        default: this.email
      },
      {
        type: 'input',
        name: 'githubUser',
        message: 'What is your GitHub username?',
        default: this.githubUser
      },
      {
        type: 'confirm',
        name: 'needRequirements',
        message: 'Do you need add projects requirements to readme?',
        default: true,

      },
      {
        type: 'checkbox',
        name: 'requirements',
        message: 'Check your requirements files',
        store: true,
        when: function(props) {
          return props.needRequirements;
        },
        choices: function() {
          var chs = [];
          var avChs = ['package.json', 'composer.json', 'Gemfile'];
          var path = self.destinationRoot();

          for (var i=0; i<avChs.length; i++) {
            var f = avChs[i];
            if (fs.existsSync(p.join(path, f))) {
              chs.push({name: f, value: f, checked: true});
            }
          }
          return chs;

        }
      }
    ];

    this.prompt(prompts, function(props) {
      for (var prop in props) {
        this[prop] = props[prop];
      }
      done();
    }.bind(this));
  },

  readme: function(objs) {
    var self = this;
    var newReqs = [];
    var updateRequirements = function(reqs) {
      var root = self.destinationRoot();
      for (var i=0; i<reqs.length; i++) {
        var n = reqs[i];
        var path = p.join(root, n);
        var content = self.read(path);
        var parsed = parser.parse(n, content);


        if (parsed) {
          newReqs.push(parsed);
        }
      }
      self.requirements = newReqs;
    }

    if (this.requirements.length > 0) {
      updateRequirements(this.requirements);
    }
    // console.log(this.requirements);
    this.template('_readme.md', 'README.md');
  }
});

module.exports = ReadmeGenerator;
