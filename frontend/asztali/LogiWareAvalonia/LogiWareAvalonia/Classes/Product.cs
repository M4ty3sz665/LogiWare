using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LogiWareAvalonia.Classes
{
    class Product
    {
       public string name { get; set; }
       public int price_net { get; set; }
       public int price_gross { get; set; }
       public int vat_rate { get; set; }
       public int product_code { get; set; }
    }
}
