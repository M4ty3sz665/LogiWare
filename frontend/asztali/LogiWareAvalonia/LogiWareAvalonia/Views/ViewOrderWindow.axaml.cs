using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Markup.Xaml;
using LogiWareAvalonia.Classes;
using LogiWareAvalonia.ViewModels;
using System;

namespace LogiWareAvalonia.Views;

public partial class ViewOrderWindow : Window
{
    public ViewOrderWindow(Order order)
    {
        InitializeComponent();
        DataContext = new LogiWareAvalonia.ViewModels.ViewOrdersViewModel();
    }
}