using Avalonia.Controls;
using CommunityToolkit.Mvvm.Input;
using System.Security.Cryptography.X509Certificates;

namespace LogiWareAvalonia.Views;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new ViewModels.MainWindowViewModel();
    }
}
