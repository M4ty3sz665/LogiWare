using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LogiWareAvalonia.Classes
{
    public class User
    {
        public int id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string passsword { get; set; }
        public string role { get; set; }
        public string joined_at { get; set; }
        public bool admin { get; set; }
        public string token { get; set; }
    }
}
