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
        public int product_id { get; set; }
        public bool missing_product { get; set; }
        public string product_name { get; set; }
        public int item_id { get; set; }
        public int amount { get; set; }
        public int price_net { get; set; }
        public int price_gross { get; set; }
        public int vat_rate { get; set; }
        public string product_code { get; set; }
        public DateTime createdAt { get; set; }
        public DateTime updatedAt { get; set; }
    }
}
