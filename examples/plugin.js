'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (babel) {
  var t = babel.types;


  return {
    visitor: {
      Program: function Program(path, state) {
        var modules = state.opts.modules || [];
        Object.values(path.scope.bindings).filter(function (binding) {
          return t.isImportDefaultSpecifier(binding.path) || t.isImportNamespaceSpecifier(binding.path) || t.isImportSpecifier(binding.path);
        }).filter(function (binding) {
          var p = binding.path.findParent(function (parentPath) {
            return parentPath.isImportDeclaration();
          });
          return modules.indexOf(p.node.source.value) >= 0;
        }).forEach(function (binding) {
          removeBinding(t, binding);
        });
      }
    }
  };
};

var getRemovedStatement = function getRemovedStatement(t) {
  return t.expressionStatement(t.stringLiteral('This statement has been removed'));
};
var getRemovedDeclaration = function getRemovedDeclaration(t) {
  return t.variableDeclaration('var', [t.variableDeclarator(t.identifier('not_in_use_' + Date.now()))]);
};
var getRemovedReturnStatement = function getRemovedReturnStatement(t) {
  return t.returnStatement();
};

function removeBinding(t, binding) {
  var shouldRemoveFunctionCalls = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  if (!binding) return;
  var paths = binding.referencePaths;
  paths.forEach(function (path) {
    var parentPath = path.findParent(function (p) {
      return p.isExpressionStatement() || p.isVariableDeclaration() || p.isReturnStatement();
    });
    if (!parentPath) return;
    if (parentPath.isExpressionStatement()) {
      if (!shouldRemoveFunctionCalls && parentPath.node.expression.callee === path.node) {
        return;
      }
      parentPath.replaceWith(getRemovedStatement(t));
    } else if (parentPath.isVariableDeclaration()) {
      parentPath.traverse({
        VariableDeclarator: function VariableDeclarator(p) {
          removeBinding(t, parentPath.scope.bindings[p.node.id.name]);
        }
      });
      parentPath.replaceWith(getRemovedDeclaration(t));
    } else {
      var funcPath = parentPath.findParent(function (p) {
        return p.isFunctionDeclaration();
      });
      var name = funcPath.node.id.name;
      removeBinding(t, funcPath.parentPath.scope.bindings[name], false);
      parentPath.replaceWith(getRemovedReturnStatement(t));
    }
  });
}