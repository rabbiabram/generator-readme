# <%= name %>

> <%= description %>

## Author

© <%= year %> <%= author %> <<%= email %>>

<% if (requirements && requirements.length > 0) { %>
## Dependencies

<% _.forEach(requirements, function(req) { %>

### <%= req.name %>

<% _.forEach(req.list, function(p, k) { %> 
* <%= k %>: <%= p %>
<% }) %>

<% }); %>

<% } %>
## License

Released under the [MIT license](http://<%= githubUser %>.mit-license.org).
