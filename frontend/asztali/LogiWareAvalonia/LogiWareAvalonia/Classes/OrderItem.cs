using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LogiWareAvalonia.Classes
{
    public class OrderItem
    {
        public int id { get; set; }
        public int product_id { get; set; }
        public Product ?product { get; set; }
        public int order_id { get; set; }
        public int amount { get; set; }
        public int unit_price_net { get; set; }
        public int unit_price_gross { get; set; }
        public int vat_rate { get; set; }
    }
}
