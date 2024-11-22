export var Role;
(function (Role) {
    Role[Role["ADMIN"] = 0] = "ADMIN";
    Role[Role["READ_ONLY"] = 1] = "READ_ONLY";
    Role[Role["WRITE_ONLY"] = 2] = "WRITE_ONLY";
    Role[Role["ERP_API_USER"] = 3] = "ERP_API_USER";
    Role[Role["CUSTOMER"] = 4] = "CUSTOMER";
})(Role || (Role = {}));
