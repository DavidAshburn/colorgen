class ColorsController < ApplicationController
  def index
    @colors = Color.all
    respond_to do |format|
      format.json { render json: @colors }
    end
  end
end