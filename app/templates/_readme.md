# <%= name %>
<% if (needTravisBadge) { %>
[![Build Status](https://travis-ci.org/<%= gihtubShortUrl %>.svg?branch=master)](https://travis-ci.org/<%= gihtubShortUrl %>)
<% } %>

> <%= description %>

## Installation
<% if (installation) { %>
```bash
    <%= installation %>
```<% } %>

<% if (requirements && requirements.length > 0) { %>
## Dependencies
<% _.forEach(requirements, function(req) { %>
### <%= req.name %>
<% _.forEach(req.list, function(p, k) { %> 
* <%= k %>: <%= p %>
<% }) %><% }); %><% } %>


## Author
© <%= year %> <%= author %> <<%= email %>>

## License

Released under the [MIT license](http://<%= githubUser %>.mit-license.org).
