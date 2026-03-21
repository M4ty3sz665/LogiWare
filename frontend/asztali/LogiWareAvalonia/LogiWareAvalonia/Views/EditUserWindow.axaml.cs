using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using LogiWareAvalonia.Classes;
using LogiWareAvalonia.ViewModels;
namespace LogiWareAvalonia;

public partial class EditUserWindow : Window
{
    public EditUserWindow(User user)
    {
        InitializeComponent();
        DataContext = new EditUserWindowViewModel(user);
    }
    public EditUserWindow() { }
}