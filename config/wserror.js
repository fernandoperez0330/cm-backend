module.exports = function(){
  return {
    "400"  :{"code":"400","msg":"{{error.verify_input}}"},
    "401"  :{"code":"401","msg":"{{error.problem_authentication}}"},
    "403"  :{"code":"403","msg":"{{error.access_not_authorized}}"},
    "404"  :{"code":"404","msg":"{{error.method_not_found}}"},
    "4001" :{"code":"4001","msg":"{{error.invalid_login}}"},
    "4002" :{"code":"4002","msg":"{{error.invalid_session}}"},
    "4003" :{"code":"4003","msg":"{{error.school_not_found}}"},
    "500"  :{"code":"500","msg":"{{error.internal_error}}"},
    "5001" :{"code":"5001","msg":"{{error.adding_school}}"},
    "5002" :{"code":"5002","msg":"{{error.update_school}}"},
    "5003" :{"code":"5003","msg":"{{error.error_finding_school}}"},
    "5004" :{"code":"5004","msg":"{{error.error_adding_table}}"},
    "5005" :{"code":"5005","msg":"{{error.error_finding_table}}"},
    "5023" :{"code":"5023","msg":"{{error.making_login}}"}
  }
};
