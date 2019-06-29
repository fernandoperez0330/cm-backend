module.exports = function(){
  return {
    "400"  :{"code":"400","msg":"{{error.verify_input}}"},
    "401"  :{"code":"401","msg":"{{error.problem_authentication}}"},
    "403"  :{"code":"403","msg":"{{error.access_not_authorized}}"},
    "404"  :{"code":"404","msg":"{{error.method_not_found}}"},
    "500"  :{"code":"500","msg":"{{error.internal_error}}"}
  };
};
