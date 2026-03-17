using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LogiWareAvalonia.Classes
{
    public class Stock
    {
        public int id { get; set; }
        public string product_name { get; set; }
        public int item_id { get; set; }
        public int amount { get; set; }
        public DateOnly created_at { get; set; }
    }
}
