module.exports = function(){
  return {
    "400"  :{"code":"400","msg":"{{error.verify_input}}"},
    "401"  :{"code":"401","msg":"{{error.problem_authentication}}"},
    "403"  :{"code":"403","msg":"{{error.access_not_authorized}}"},
    "404"  :{"code":"404","msg":"{{error.method_not_found}}"},
    "4001" :{"code":"404","msg":"{{error.invalid_login}}"},
    "4002" :{"code":"404","msg":"{{error.invalid_session}}"},
    "500"  :{"code":"500","msg":"{{error.internal_error}}"},
    "5023" :{"code":"500","msg":"{{error.making_login}}"},
  };
};
