import d3 from './d3.js';

console.log(d3.select);

const funcOrObj = (map, func, obj) =>
  (typeof map === 'function' ? func : obj);

function attrsFunction(_selection, map) {
  return _selection.each(function() {
    const x = map.apply(this, arguments);
    const s = d3.selection.select(this);
    for (var name in x) s.attr(name, x[name]);
  });
}

function attrsObject(_selection, map) {
  for (var name in map) _selection.attr(name, map[name]);
  return _selection;
}

var selection_attrs = function(map) {
  return (funcOrObj(map, attrsFunction, attrsObject))(this, map);
};

function stylesFunction(_selection, map, priority) {
  return _selection.each(function() {
    const x = map.apply(this, arguments)
    const s = d3.selection.select(this);
    for (var name in x) s.style(name, x[name], priority);
  });
}

function stylesObject(_selection, map, priority) {
  for (var name in map) _selection.style(name, map[name], priority);
  return _selection;
}

var selection_styles = function(map, priority) {
  return (funcOrObj(map, stylesFunction, stylesObject))
    (this, map, priority == null ? "" : priority);
};

function propsFunc(_selection, map) {
  return _selection.each(function() {
    const x = map.apply(this, arguments);
    const s = d3.selection.select(this);
    for (var name in x) s.property(name, x[name]);
  });
}

function propsObj(_selection, map) {
  for (var name in map) _selection.property(name, map[name]);
  return _selection;
}

var selection_properties = function(map) {
  return (funcOrObj(map, propsFunc, propsObj))(this, map);
};

function attrsFunc(transition, map) {
  return transition.each(function() {
    const x = map.apply(this, arguments);
    const t = d3.selection.select(this).transition(transition);
    for (var name in x) t.attr(name, x[name]);
  });
}

function attrsObj(transition, map) {
  for (var name in map) transition.attr(name, map[name]);
  return transition;
}

var transition_attrs = function(map) {
  return (funcOrObj(map, attrsFunc, attrsObj))(this, map);
};

function stylesFunction$1(transition, map, priority) {
  return transition.each(function() {
    const x = map.apply(this, arguments);
    const t = d3.selection.select(this).transition(transition);
    for (var name in x) t.style(name, x[name], priority);
  });
}

function stylesObject$1(transition, map, priority) {
  for (var name in map) transition.style(name, map[name], priority);
  return transition;
}

var transition_styles = function(map, priority) {
  return (funcOrObj(map, stylesFunction$1, stylesObject$1))
    (this, map, priority == null ? "" : priority);
};

d3.selection.prototype.attrs = selection_attrs;
d3.selection.prototype.styles = selection_styles;
d3.selection.prototype.properties = selection_properties;
d3.transition.prototype.attrs = transition_attrs;
d3.transition.prototype.styles = transition_styles;


export default d3;
