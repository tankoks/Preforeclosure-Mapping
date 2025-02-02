class Api::V1::HomesController < ApplicationController

  before_action :set_home, only: [:show, :update, :destroy]

  # GET /homes
  def index
    @homes = Home.all

    render json: @homes
  end

  # GET /homes/1
  def show
    render json: @home
  end

  # POST /homes
  def create

    @home = Home.new(home_params)

    begin
      if @home.save
        render json: @home, status: :created, location: api_v1_homes_url(@home)
      else
        render json: @home.errors, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotUnique
      set_home
      @home.update(home_params)
      render json: @home
    end

  end

  # PATCH/PUT /homes/1
  def update
    if @home.update(home_params)
      render json: @home
    else
      render json: @home.errors, status: :unprocessable_entity
    end
  end

  # DELETE /homes/1
  def destroy
    @home.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_home
      @home = Home.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def home_params
      params.require(:home).permit(:id, :address, :price, :zipcode, :county, :loandate, :auctionmonth, :firstlistingdate, :lastseendate, :lat, :lng)
    end
end
