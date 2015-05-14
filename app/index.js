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
    var self = this;

    var done = this.async();
    gitConfig(function(err, config) {
      if(err) {
        return done();
      }
      this.author = null;
      this.email = null;
      if (config && config.user) {
        this.author = config.user.name;
        this.email = config.user.email;        
      }
      this.githubUser = null;
      if (config.github && config.github.user) {
        this.githubUser = config.github.user;
      }
      var exec = require('child_process').exec;
      exec('git remote -v', function(err, stdout, stderr) {
        if (err) {
          return done();
        }

        if (stdout) {
          var remotes = stdout.replace('\r', '').split('\n');
          _.each(remotes, function(e) {
            var e = e.split('\t');
            if (e[0] === 'origin') {
              var remote = e[1].split(' ')[0];
              self.gitRemote = remote;
            }
          });
        }
        if (self.gitRemote.indexOf('gihtub' !== -1)) {
          self.gihtubShortUrl = self.gitRemote.split(':').slice(-1)[0].split('.')[0];
        }
        return done();

      });
      // done();
    }.bind(this));
  },

  askFor: function() {
    var done = this.async();

    this.log(yosay('Welcome to the marvelous Readme generator!'));
    var self = this;
    var root = this.destinationRoot();

    var description = "";
    var appname = this.appname;
    if (fs.existsSync(p.join(root, 'package.json'))) {
      try {
         var pkgJson = this.read(p.join(root, 'package.json'));
        try {
          pkgJson = JSON.parse(pkgJson);
          description = pkgJson.description;
          appname = pkgJson.name;
        } catch (e) {

        }       
      } catch(e) {
        console.log(e);
      }

    }

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
        message: 'Briefly describe the project',
        store: true,
        default: description,
      },
      {
        type: 'input',
        name: 'installation',
        message: 'How to install your project?',
        store: true,
        default: 'npm i ' + appname,

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
      },
      {
        type: 'confirm',
        name: 'needTravisBadge',
        message: 'Do you need to add travis badge?',
        store: true,
        default: true,
        when: function(props) {
          return fs.existsSync('.travis.yml') && self.gitRemote;
        }
      },
      {
        type: 'input',
        name: 'gihtubShortUrl',
        message: 'Specify your GitHub <username/repo>:',
        store: true,
        default: this.gihtubShortUrl,
        when: function(props) {
          return props.needTravisBadge;
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
        var parsed = null;
        try {
          var content = self.read(path);
          var parsed = parser.parse(n, content);         
        } catch(e) {
          console.log('File ' + path + ' don\'t readable');
        }
        if (parsed) {
          newReqs.push(parsed);
        }
      }
      self.requirements = newReqs;
    }

    if (this.requirements && this.requirements.length > 0) {
      updateRequirements(this.requirements);
    }
    this.template('_readme.md', 'README.md');
  }
});

module.exports = ReadmeGenerator;
