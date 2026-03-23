using Avalonia.Controls;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace LogiWareAvalonia.Classes
{
    public class MessageWindow : Window
    {
        public Button okButton;
        public MessageWindow(string message, string type)
        {
            Width = 350;
            Height = 180;
            CanResize = false;
            WindowStartupLocation = WindowStartupLocation.CenterOwner;
            Title = type;
            Background = new SolidColorBrush(Color.Parse("#2B2B30"));
            var text = new TextBlock
            {
                Text = message,
                TextWrapping = TextWrapping.Wrap,
                FontSize = 16,
                Margin = new Thickness(0, 0, 0, 15),
                Foreground = Brushes.White
            };

            okButton = new(){
                Content = "OK",
                Width = 80,
                HorizontalAlignment = HorizontalAlignment.Center
            };
            okButton.Click += (s,e) => this.Close();

            var layout = new StackPanel
            {
                Spacing = 15,
                Children =
            {
                text,
                okButton
            }
            };

            Content = new Border
            {
                Padding = new Thickness(20),
                Child = layout
            };
        }

        public static async Task Show(Window owner, string message, string type)
        {
            var win = new MessageWindow(message, type);
            await win.ShowDialog(owner);
        }
    }
}
