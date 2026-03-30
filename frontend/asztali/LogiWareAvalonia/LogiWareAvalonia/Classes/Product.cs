using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LogiWareAvalonia.Classes
{
    public class Product
    {
        public int id { get; set; }
       public string name { get; set; }
       public int price_net { get; set; }
       public int price_gross { get; set; }
       public int vat_rate { get; set; }
        public int? supplier_id { get; set; }
        public int low_stock_threshold { get; set; }
    }
}
