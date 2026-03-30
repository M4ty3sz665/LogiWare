using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LogiWareAvalonia.Classes
{
    public class Order
    {
        public int order_number { get; set; }
        public int company_id { get; set; }
        public string company_name { get; set; }
        public DateTime created_at { get; set; }
        public DateOnly due_date { get; set; }
        public string due_time { get; set; }
        public string status { get; set; }
        public string payment_status { get; set; }
        public string payment_method { get; set; }
    }
}
