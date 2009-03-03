require 'test_helper'

class AdministratorsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:administrators)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create administrator" do
    assert_difference('Administrator.count') do
      post :create, :administrator => { }
    end

    assert_redirected_to administrator_path(assigns(:administrator))
  end

  test "should show administrator" do
    get :show, :id => administrators(:one).id
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => administrators(:one).id
    assert_response :success
  end

  test "should update administrator" do
    put :update, :id => administrators(:one).id, :administrator => { }
    assert_redirected_to administrator_path(assigns(:administrator))
  end

  test "should destroy administrator" do
    assert_difference('Administrator.count', -1) do
      delete :destroy, :id => administrators(:one).id
    end

    assert_redirected_to administrators_path
  end
end
