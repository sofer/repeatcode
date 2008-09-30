require 'test_helper'

class SubjectsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:subjects)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create subject" do
    assert_difference('Subject.count') do
      post :create, :subject => { }
    end

    assert_redirected_to subject_path(assigns(:subject))
  end

  test "should show subject" do
    get :show, :id => subjects(:one).id
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => subjects(:one).id
    assert_response :success
  end

  test "should update subject" do
    put :update, :id => subjects(:one).id, :subject => { }
    assert_redirected_to subject_path(assigns(:subject))
  end

  test "should destroy subject" do
    assert_difference('Subject.count', -1) do
      delete :destroy, :id => subjects(:one).id
    end

    assert_redirected_to subjects_path
  end
end
